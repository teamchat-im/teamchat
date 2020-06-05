json.users @users do |user|
  json.name user.name
  json.username user.username
  json.avatar_url url_for(user.avatar_thumb)
end
