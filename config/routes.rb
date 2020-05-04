Rails.application.routes.draw do
  root 'home#index'

  get 'sign_up', to: 'users#new', as: 'sign_up'
  resources :users, only: [:create]
end
