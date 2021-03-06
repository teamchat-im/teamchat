require 'sidekiq/web'

Rails.application.routes.draw do
  root 'home#index'

  get 'sign_up', to: 'users#new', as: 'sign_up'
  resources :users, only: [:create]
  get 'sign_in', to: 'sessions#new', as: 'sign_in'
  delete 'sign_out', to: 'sessions#destroy', as: 'sign_out'
  resources :sessions, only: [:create]

  namespace :users do
    resources :search, only: [:index]
  end

  resources :rooms, only: [:new, :create, :show] do
    resources :messages, only: [:index, :create, :destroy]
  end

  namespace :settings do
    resource :profile
  end

  mount Sidekiq::Web => '/sidekiq'
end
