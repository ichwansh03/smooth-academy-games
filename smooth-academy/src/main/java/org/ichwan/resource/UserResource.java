package org.ichwan.resource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ichwan.entity.OperatorType;
import org.ichwan.entity.User;
import org.ichwan.service.UserService;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserService userService;

    @POST
    @Path("/register")
    public Response register(Map<String, String> body) {
        User user = userService.register(
                body.get("email"),
                body.get("password"),
                body.get("displayName"));
        return Response.created(URI.create("/api/users/" + user.getId()))
                .entity(user)
                .build();
    }

    @POST
    @Path("/login")
    public Response login(Map<String, String> body) {
        try {
            User user = userService.login(
                    body.get("email"),
                    body.get("password"));
            return Response.ok(user).build();
        } catch (WebApplicationException e) {
            if (e.getResponse().getStatus() == 401) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(Map.of("error", "Email atau password salah"))
                        .build();
            }
            throw e;
        }
    }

    @GET
    @Path("/by-email/{email}")
    public User getUserByEmail(@PathParam("email") String email) {
        return userService.findByEmail(email);
    }

    @GET
    @Path("/{id}")
    public User getUser(@PathParam("id") UUID id) {
        return userService.findById(id);
    }

    @GET
    @Path("/{id}/operators")
    public List<String> getUserOperators(@PathParam("id") UUID id) {
        userService.findById(id);
        return userService.getOperators(id);
    }

    @PUT
    @Path("/{id}/operators")
    public Response setUserOperators(@PathParam("id") UUID id, Map<String, List<String>> body) {
        User user = userService.findById(id);
        List<String> ops = body.get("operators");
        if (ops == null) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        List<OperatorType> operators = ops.stream()
                .map(op -> {
                    try {
                        return OperatorType.valueOf(op.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        throw new WebApplicationException("Invalid operator: " + op, Response.Status.BAD_REQUEST);
                    }
                })
                .toList();
        userService.setOperators(user, operators);
        return Response.ok(Map.of("operators", userService.getOperators(id))).build();
    }

    @POST
    @Path("/{id}/operators/grant")
    public Response grantOperator(@PathParam("id") UUID id, Map<String, String> body) {
        User user = userService.findById(id);
        try {
            OperatorType op = OperatorType.valueOf(body.get("operator").toUpperCase());
            userService.grantOperator(user, op);
            return Response.ok(Map.of("operators", userService.getOperators(id))).build();
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Invalid operator", Response.Status.BAD_REQUEST);
        }
    }

    @POST
    @Path("/{id}/operators/revoke")
    public Response revokeOperator(@PathParam("id") UUID id, Map<String, String> body) {
        User user = userService.findById(id);
        try {
            OperatorType op = OperatorType.valueOf(body.get("operator").toUpperCase());
            userService.revokeOperator(user, op);
            return Response.ok(Map.of("operators", userService.getOperators(id))).build();
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Invalid operator", Response.Status.BAD_REQUEST);
        }
    }
}
