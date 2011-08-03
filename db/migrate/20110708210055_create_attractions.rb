class CreateAttractions < ActiveRecord::Migration
  def self.up
    create_table :attractions do |t|
      t.string :name
      t.float :latitude
      t.float :longitude
      t.string :yelp_id
      t.timestamps
    end
    add_index :attractions, :yelp_id, { :name => "attractions_yelp_id_index" }
  end

  def self.down
    drop_table :attractions
  end
end
