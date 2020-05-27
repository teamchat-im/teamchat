class CreateMessages < ActiveRecord::Migration[6.0]
  def change
    create_table :messages do |t|
      t.references :room
      t.references :user
      t.string :uid
      t.text :body

      t.timestamps

      t.index :uid, unique: true
    end
  end
end
