insert into achievements (slug, title, description, icon, category, rarity, xp_reward, game_slug)
select v.slug, v.title, v.description, v.icon, 'arcade', v.rarity, v.xp_reward, 'mmmunchers'
from (values
  ('mmmunchers-first-game','FIRST BITE','Finish your first game.','fa-utensils','common',10),
  ('mmmunchers-streak-5','GET MUNCHING','Chain 5 correct answers without breaking your streak.','fa-fire','common',15),
  ('mmmunchers-streak-10','BRAIN BUFFET','Chain 10 correct answers without breaking your streak.','fa-brain','rare',30),
  ('mmmunchers-streak-25','UNSTOPPABLE APPETITE','Chain 25 correct answers without breaking your streak.','fa-bolt','epic',80),
  ('mmmunchers-score-1000','THOUSAND CRUNCH','Score 1,000 points in one game.','fa-star','common',20),
  ('mmmunchers-score-5000','FEAST MODE','Score 5,000 points in one game.','fa-trophy','rare',50),
  ('mmmunchers-topics-5','BALANCED DIET','Play 5 different topics.','fa-book-open','rare',40),
  ('mmmunchers-games-50','REGULAR AT THE ARCADE','Finish 50 games.','fa-gamepad','epic',100),
  ('mmmunchers-perfect-round','CLEAN PLATE','Clear a board with no wrong answers or lost lives.','fa-check-circle','rare',30),
  ('mmmunchers-level-10','TOP OF THE FOOD CHAIN','Reach level 10 in one game.','fa-crown','epic',80)
) as v(slug,title,description,icon,rarity,xp_reward)
where not exists (select 1 from achievements a where a.slug = v.slug)
returning slug, title, rarity, xp_reward;
