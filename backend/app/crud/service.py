from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


def create_user_service(db: Session, user_id: int, service_in: ServiceCreate) -> Service:
    db_service = Service(
        user_id=user_id,
        title=service_in.title.strip(),
        description=service_in.description,
        duration_minutes=service_in.duration_minutes,
        price=service_in.price,
        is_active=service_in.is_active,
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def get_services_by_user_id(db: Session, user_id: int, only_active: bool = True) -> list[Service]:
    stmt = select(Service).where(Service.user_id == user_id)
    if only_active:
        stmt = stmt.where(Service.is_active == True)
    stmt = stmt.order_by(Service.id.asc())
    return list(db.scalars(stmt).all())


def update_service(db: Session, service: Service, service_in: ServiceUpdate) -> Service:
    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "title" and isinstance(value, str):
            value = value.strip()
        setattr(service, field, value)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


def delete_service(db: Session, service: Service) -> None:
    db.delete(service)
    db.commit()