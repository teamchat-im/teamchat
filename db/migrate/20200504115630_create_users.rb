class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :username, null: false
      t.string :email, null: false
      t.string :display_name
      t.text :bio
      t.string :password_digest

      t.timestamps

      t.index 'lower(username)', unique: true
      t.index 'lower(email)', unique: true
    end
  end
end
