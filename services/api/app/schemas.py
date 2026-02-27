from pydantic import BaseModel
from datetime import datetime

class KPIs(BaseModel):
  from_ts: datetime
  to_ts: datetime
  revenue: float
  orders: int
  items: int

class ShopHourly(BaseModel):
  bucket_start: datetime
  shop_id: str
  revenue: float
  orders: int
  items: int