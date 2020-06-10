class CreateRoomMemberships < ActiveRecord::Migration[6.0]
  def change
    create_table :room_memberships do |t|
      t.references :room
      t.references :user
      t.integer :role, default: 0

      t.timestamps
    end
  end
end
