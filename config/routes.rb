Kakule::Application.routes.draw do
  
  resources :tags

  get "home/index"

  # Calendar
  get "calendar/render_calendar"
  match 'calendar(/:year(/:month))' => 'calendar#index', :as => :calendar, :constraints => {:year => /\d{4}/, :month => /\d{1,2}/}

  # Itineraries
  get 'itineraries/render_day' 
  
  post 'itineraries/edit_name'
  post 'itineraries/add_event'
  post 'itineraries/fork'
  post 'itineraries/drag_event_time'
  post 'itineraries/resize_event_time'
  match 'itineraries/:id/timeline' => 'itineraries#timeline', :via => :get
  match 'itineraries/:id' => 'itineraries#show'
  match 'itineraries/:id/finalize' => 'itineraries#finalize'
  match 'itineraries/:id/event/create' => 'itineraries#create_event'
  match 'itineraries/:id/event/update/:event_id' => 'itineraries#update_event'
  match 'itineraries/:id/show_day/:year-:month-:day' => 'itineraries#show_day', :constraints => {:year => /\d{4}/, :month => /\d{1,2}/, :day => /\d{1,2}/}, :via => :get
  

  # Search
  post "search/events"
  post "search/locations"
  post "search/flights"
  post "search/hotels"
  post "search/cars"
  post "search/meals"
  get "search/places"
  post "search/photos"
  get "search/render_place_by_id"
  get "search/render_attractions"
  get "search/render_photos"
  get "search/render_meals"
  get "search/questions"

  # Users/Sessions 
  match "/dashboard" => 'users#show', :as => :dashboard
  match "/login" => 'user_sessions#new', :as => :login
  match "/logout" => 'user_sessions#destroy', :as => :logout
  match "/register" => 'users#new', :as => :register
  
  # Facebook OAuth
  get 'facebook/auth', :as => :facebook_login
  get 'facebook/callback', :as => :facebook_callback
  

  resources :attractions, :events, :itineraries, :users, :user_sessions
  
  resources :questions do 
    resources :answers
  end

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => "home#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
