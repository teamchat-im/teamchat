class CreateMemberships < ActiveRecord::Migration[6.0]
  def change
    create_table :memberships do |t|
      t.references :room
      t.references :user
      t.integer :role, default: 0

      t.timestamps
    end
  end
end
