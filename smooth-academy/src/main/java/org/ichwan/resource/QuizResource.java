package org.ichwan.resource;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ichwan.entity.QuizResult;
import org.ichwan.service.QuizService;
import org.jboss.logging.Logger;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
@Path("/quiz-results")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class QuizResource {

    private static final Logger LOG = Logger.getLogger(QuizResource.class);

    @Inject
    QuizService quizService;

    @POST
    public Response submitResult(Map<String, Object> body) {
        LOG.infof("POST /quiz-results received: %s", body);
        try {
            QuizResult result = quizService.submitResult(
                    UUID.fromString(body.get("userId").toString()),
                    Integer.valueOf(body.get("levelId").toString()),
                    body.get("mode").toString(),
                    body.get("operator") != null ? body.get("operator").toString() : "add",
                    Integer.valueOf(body.get("totalQuestions").toString()),
                    Integer.valueOf(body.get("correctCount").toString()));
            LOG.infof("Quiz result saved id=%s userId=%s", result.getId(), body.get("userId"));
            return Response.created(URI.create("/api/quiz-results/" + result.getId()))
                    .entity(result)
                    .build();
        } catch (Exception e) {
            LOG.errorf("POST /quiz-results FAILED body=%s error=%s", body, e.getMessage());
            throw e;
        }
    }

    @GET
    @Path("/user/{userId}")
    public List<QuizResult> getUserResults(@PathParam("userId") UUID userId) {
        List<QuizResult> results = quizService.getUserResults(userId);
        LOG.debugf("GET /quiz-results/user/%s -> %d results", userId, results.size());
        return results;
    }

    @GET
    @Path("/{id}")
    public QuizResult getResult(@PathParam("id") UUID id) {
        return quizService.findById(id);
    }
}
