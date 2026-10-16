from sqlalchemy import Column, Integer, Float, String
from database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)

    order_date = Column(String)
    product = Column(String)
    category = Column(String)
    region = Column(String)

    quantity = Column(Integer)
    unit_price = Column(Float)
    discount = Column(Float)

    sales = Column(Float)
    profit = Column(Float)