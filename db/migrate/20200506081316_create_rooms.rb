class CreateRooms < ActiveRecord::Migration[6.0]
  def change
    create_table :rooms do |t|
      t.string :uid
      t.integer :visibility, default: 0
      t.string :name
      t.string :alias
      t.boolean :direct, default: false
      t.references :owner

      t.timestamps

      t.index :uid, unique: true
      t.index :alias, unique: true, where: 'alias IS NOT NULL'
    end
  end
end
