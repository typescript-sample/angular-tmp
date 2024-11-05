export const config = {
  authentication_url: 'http://localhost:8083',
  signup_url: 'http://localhost:8083/signup',
  password_url: 'http://localhost:8083/password',
  oauth2_url: 'http://localhost:8083/oauth2',

  user_url: 'http://localhost:8083/users',
  role_url: 'http://localhost:8083/roles',
  privilege_url: 'http://localhost:8083/privileges',
  audit_log_url: 'http://localhost:8080/audit-logs',
  cinema_url: 'http://localhost:8080/cinema',
  category_url: 'http://localhost:8080/categories',
  film_url: 'http://localhost:8080/films',
  location_url: 'http://localhost:8085/locations',
  location_rate_url: 'http://localhost:8085/locationsrate',
  myprofile_url: 'http://localhost:8082/my-profile',
  profile_url:'http://localhost:8082/users',
  skill_url:'http://localhost:8082/skills',
  interest_url:'http://localhost:8082/interests',
  looking_for_url:'http://localhost:8082/looking-for',
  item_url: 'http://localhost:9000/items',
  article_url: 'http://localhost:9000/articles',
  appreciation_url: 'http://localhost:8082/appreciation',
  appreciation_reply_url:'http://localhost:8082/appreciation-reply'
};

export const env = {
  sit: {
    authentication_url: 'http://10.1.0.234:3003'
  },
  deploy: {
    authentication_url: '/server'
  }
};
