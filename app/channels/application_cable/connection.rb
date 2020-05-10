module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_user
    end

    private

    def find_user
      if cookies[:auth_token] && user = User.find_by(auth_token: cookies[:auth_token])
        user
      else
        reject_unauthorized_connection
      end
    end
  end
end
