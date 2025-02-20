class UserSessionsController < ApplicationController

  def new
    @session = UserSession.new
  end
  
  def create
    @session = UserSession.new(params[:user_session])
    if @session.save
      flash[:notice] = "Login successful!"
      redirect_to root_url
    else
      render :action => :new
    end
  end

  def destroy
    flash[:notice] = "Logout successful!"
    current_user_session && current_user_session.destroy
    redirect_to :root
  end
end
