package org.ichwan.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.WebApplicationException;
import org.ichwan.entity.Level;
import org.ichwan.repository.LevelRepository;

import java.util.List;

@ApplicationScoped
public class LevelService {

    @Inject
    LevelRepository levelRepository;

    @Inject
    SeedService seedService;

    public List<Level> listAll() {
        seedService.seed();
        return levelRepository.list("ORDER BY sortOrder");
    }

    public Level findById(Integer id) {
        seedService.seed();
        return levelRepository.findByIdOptional(id)
                .orElseThrow(() -> new WebApplicationException(404));
    }
}
