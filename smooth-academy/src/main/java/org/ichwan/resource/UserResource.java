package org.ichwan.resource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ichwan.entity.Level;
import org.ichwan.entity.OperatorType;
import org.ichwan.entity.User;
import org.ichwan.entity.UserOperator;
import org.ichwan.service.AccessService;
import org.ichwan.service.UserService;

import java.net.URI;
import java.time.Duration;
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

    @Inject
    AccessService accessService;

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
            userService.grantEntitlement(user, op, null, null, org.ichwan.entity.SourceType.SUBSCRIPTION);
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

    @POST
    @Path("/{id}/subscribe")
    public Response subscribeOperator(@PathParam("id") UUID id, Map<String, Object> body) {
        User user = userService.findById(id);
        try {
            OperatorType op = OperatorType.valueOf(((String) body.get("operator")).toUpperCase());
            int days = body.get("days") != null ? ((Number) body.get("days")).intValue() : 30;
            userService.subscribeOperator(user, op, Duration.ofDays(days));
            return Response.ok(Map.of("operators", userService.getOperators(id))).build();
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Invalid operator", Response.Status.BAD_REQUEST);
        }
    }

    @GET
    @Path("/{id}/access/{operator}/{levelId}")
    public Response checkAccess(@PathParam("id") UUID id,
                                @PathParam("operator") String operatorStr,
                                @PathParam("levelId") int levelId) {
        userService.findById(id);
        try {
            OperatorType op = OperatorType.valueOf(operatorStr.toUpperCase());
            boolean canPlay = accessService.canPlayLevel(id, op, levelId);
            return Response.ok(Map.of("canPlay", canPlay)).build();
        } catch (IllegalArgumentException e) {
            throw new WebApplicationException("Invalid operator", Response.Status.BAD_REQUEST);
        }
    }

    @GET
    @Path("/{id}/entitlements")
    public List<Map<String, Object>> getEntitlements(@PathParam("id") UUID id) {
        userService.findById(id);
        return accessService.getAllActiveEntitlements(id).stream()
                .map(uo -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("operator", uo.getOperator().name().toLowerCase());
                    m.put("maxLevel", uo.getMaxLevel() != null ? uo.getMaxLevel().getSortOrder() : null);
                    m.put("expiresAt", uo.getExpiresAt() != null ? uo.getExpiresAt().toString() : null);
                    m.put("source", uo.getSource().name());
                    m.put("active", uo.isActive());
                    return m;
                })
                .toList();
    }
}
