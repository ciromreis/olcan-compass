await page.route('**/*', async (route) => {
  const url = route.request().url();

  if (url.includes('/auth/me')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 7,
        email: 'demo@olcan.com',
        username: 'demo',
        full_name: 'Ciro Demo',
        avatar_url: null,
        bio: null,
        level: 12,
        xp: 1840,
        is_active: true,
        is_verified: true,
        is_premium: true,
        created_at: '2026-01-12T12:00:00Z',
      }),
    });
    return;
  }

  if (url.includes('/companions/')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 11,
          name: 'Nuri',
          type: 'global_nomad',
          level: 12,
          xp: 1840,
          xp_to_next: 2400,
          evolution_stage: 'mature',
          abilities: [
            {
              id: 'signal-reader',
              name: 'Leitura de Sinais',
              description: 'Identifica padrões de progresso',
              type: 'passive',
              unlockedAt: '2026-02-10T10:00:00Z',
            },
          ],
          stats: {
            power: 78,
            wisdom: 88,
            charisma: 74,
            agility: 69,
          },
          current_health: 92,
          max_health: 100,
          energy: 76,
          max_energy: 100,
          created_at: '2026-02-01T10:00:00Z',
        },
      ]),
    });
    return;
  }

  if (url.includes('/narratives')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'doc-1',
            title: 'Carta de Motivação — TU Berlin',
            narrative_type: 'motivation_letter',
            target_program: 'MSc Computer Science, TU Berlin',
            latest_overall_score: 81,
            created_at: '2026-03-01T10:00:00Z',
            updated_at: '2026-03-25T10:00:00Z',
            current_version: {
              id: 'v1',
              content:
                'Minha trajetória combina produto digital, análise e execução internacional com foco em sistemas e educação.',
              word_count: 132,
              created_at: '2026-03-25T10:00:00Z',
            },
            versions: [
              {
                id: 'v1',
                content:
                  'Minha trajetória combina produto digital, análise e execução internacional com foco em sistemas e educação.',
                word_count: 132,
                created_at: '2026-03-25T10:00:00Z',
              },
            ],
          },
        ],
      }),
    });
    return;
  }

  if (url.includes('/interviews/questions')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
    return;
  }

  if (url.includes('/interviews/sessions')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
    return;
  }

  if (url.includes('/applications/stats/dashboard')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ total: 4, submitted: 2, urgentCount: 1 }),
    });
    return;
  }

  if (/\/applications$/.test(url) || /\/routes$/.test(url) || /\/sprints$/.test(url)) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [] }),
    });
    return;
  }

  await route.continue();
});

await page.evaluate(() => {
  localStorage.setItem('access_token', 'demo-token');
  localStorage.setItem(
    'olcan-auth',
    JSON.stringify({
      state: {
        user: {
          id: '7',
          email: 'demo@olcan.com',
          full_name: 'Ciro Demo',
          role: 'user',
          created_at: '2026-01-12T12:00:00Z',
        },
        isAuthenticated: true,
      },
      version: 0,
    })
  );
  localStorage.setItem(
    'companion-store',
    JSON.stringify({
      state: {
        companion: {
          id: '11',
          userId: 'current_user',
          archetypeId: 'global_nomad',
          type: 'global_nomad',
          name: 'Nuri',
          level: 12,
          xp: 1840,
          xpToNext: 2400,
          evolutionStage: 'mature',
          abilities: [
            {
              id: 'signal-reader',
              name: 'Leitura de Sinais',
              description: 'Identifica padrões de progresso',
              type: 'passive',
            },
          ],
          stats: {
            power: 78,
            wisdom: 88,
            charisma: 74,
            agility: 69,
          },
          currentHealth: 92,
          maxHealth: 100,
          energy: 76,
          maxEnergy: 100,
          createdAt: '2026-02-01T10:00:00Z',
          lastCaredAt: '2026-03-27T09:00:00Z',
          currentRoute: 'academic',
        },
        companions: [],
        selectedCompanionId: '11',
        quizResults: null,
        dailyCareCompleted: ['2026-03-24', '2026-03-25', '2026-03-26', '2026-03-27'],
        careStreak: 4,
        longestStreak: 9,
        achievements: [],
        userStats: {},
        isLoading: false,
        error: null,
      },
      version: 0,
    })
  );
});
