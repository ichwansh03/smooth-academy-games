package org.ichwan.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.ichwan.entity.Level;
import org.ichwan.repository.LevelRepository;

@ApplicationScoped
public class SeedService {

    @Inject
    LevelRepository levelRepository;

    @Transactional
    public void seed() {
        if (levelRepository.count() > 0) return;

        levelRepository.persist(Level.builder().id(1).name("Ones Star").icon("🌟").label("1–9").minRange(1).maxRange(9).requiredStars(0).sortOrder(1).build());
        levelRepository.persist(Level.builder().id(2).name("Tens Star").icon("⭐🌟").label("10–99").minRange(10).maxRange(99).requiredStars(3).sortOrder(2).build());
        levelRepository.persist(Level.builder().id(3).name("Hundreds Star").icon("💫").label("100–999").minRange(100).maxRange(999).requiredStars(3).sortOrder(3).build());
        levelRepository.persist(Level.builder().id(4).name("Thousands Star").icon("✨").label("1000–9999").minRange(1000).maxRange(9999).requiredStars(3).sortOrder(4).build());
    }
}
