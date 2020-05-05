module Authenticate
  extend ActiveSupport::Concern

  included do
    before_action :authenticate
  end

  private

  def authenticate
    if cookies[:auth_token]
      unless Current.user = User.find_by(auth_token: cookies[:auth_token])
        sign_out
      end
    end
  end

  def require_sign_in
    unless Current.user
      return_path = request.get? ? request.path : URI(request.referer.presence || '/').path
      redirect_to sign_in_path(return_to: return_path), alert: t('flash.require_sign_in')
    end
  end

  def sign_in(user)
    cookies[:auth_token] = {
      value: user.auth_token,
      expires: 1.month,
      httponly: true
    }
  end

  def sign_out
    cookies[:auth_token] = nil
  end
end
