"""add_service_id_to_time_slots

Revision ID: de5b3a239d9c
Revises: 80b1c28c3d6c
Create Date: 2026-11-19 16:15:07.405121

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de5b3a239d9c'
down_revision: Union[str, Sequence[str], None] = '80b1c28c3d6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. اضافه کردن ستون به عنوان nullable
    op.add_column('time_slots', sa.Column('service_id', sa.Integer(), nullable=True))
    
    # 2. مقداردهی به سطرهای موجود با سرویس مربوط به فریلنسر
    op.execute("UPDATE time_slots SET service_id = (SELECT id FROM services WHERE user_id = time_slots.user_id LIMIT 1)")
    op.execute("UPDATE time_slots SET service_id = (SELECT id FROM services LIMIT 1) WHERE service_id IS NULL")

    # 3. اجباری کردن فیلد
    op.alter_column('time_slots', 'service_id', nullable=False)

    # 4. ساخت ایندکس و کلید خارجی
    op.create_index(op.f('ix_time_slots_service_id'), 'time_slots', ['service_id'], unique=False)
    op.create_foreign_key(
        'fk_time_slots_service_id_services',
        'time_slots',
        'services',
        ['service_id'],
        ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_time_slots_service_id_services', 'time_slots', type_='foreignkey')
    op.drop_index(op.f('ix_time_slots_service_id'), table_name='time_slots')
    op.drop_column('time_slots', 'service_id')
