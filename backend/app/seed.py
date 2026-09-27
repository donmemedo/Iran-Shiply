import random

from sqlmodel import Session, select

from app.core import engine, hash_password
from app.models import Bid, Shipment, User

CARRIERS = [
    ("09121000001", "باربری آرین ترابر", "تهران", "کامیون ۱۰ تن", 4.9, 312),
    ("09121000002", "رضا محمدی", "کرج", "وانت نیسان", 4.7, 148),
    ("09121000003", "حمل‌ونقل سپهر", "اصفهان", "خاور مسقف", 4.8, 205),
    ("09121000004", "علی کریمی", "مشهد", "کامیونت ۵ تن", 4.6, 97),
    ("09121000005", "ترابری پارس بار", "شیراز", "تریلی چادری", 5.0, 421),
    ("09121000006", "مهدی نوروزی", "تبریز", "وانت مزدا", 4.5, 63),
]
SHIPPERS = [
    ("09351000001", "سارا احمدی", "تهران"),
    ("09351000002", "فروشگاه مبل رویال", "کرج"),
    ("09351000003", "امیر صادقی", "اصفهان"),
]
LOADS = [
    ("اثاثیه یک آپارتمان ۸۰ متری", "furniture", "تهران", "کرج", 45, 1800, 22.0, 9_000_000),
    ("خودروی پژو ۲۰۷ (بدون پلاک)", "vehicle", "تهران", "مشهد", 900, 1200, 10.0, 14_500_000),
    ("موتورسیکلت هوندا ۱۲۵", "motorcycle", "قم", "اصفهان", 320, 130, 1.5, 2_800_000),
    ("۱۲ پالت کاشی ساختمانی", "pallet", "یزد", "تهران", 620, 9000, 18.0, 26_000_000),
    ("یخچال ساید بای ساید + ماشین لباسشویی", "appliance", "تهران", "شیراز", 920, 320, 4.0, 7_200_000),
    ("مبل ۷ نفره و میز ناهارخوری", "furniture", "اصفهان", "تهران", 450, 600, 14.0, 8_500_000),
    ("تجهیزات کارگاهی سبک", "other", "بندرعباس", "تهران", 1300, 2400, 12.0, 32_000_000),
    ("کاناپه تخت‌خواب‌شو", "furniture", "مشهد", "تهران", 900, 180, 5.5, 6_400_000),
    ("خودروی سواری تیبا", "vehicle", "تبریز", "تهران", 620, 1050, 9.0, 11_000_000),
    ("۴۰ کارتن لوازم دکوری", "other", "تهران", "رشت", 330, 700, 8.0, 5_100_000),
    ("پیانوی دیجیتال + لوازم جانبی", "other", "تهران", "قم", 140, 120, 2.0, 3_200_000),
    ("ماشین ظرفشویی و اجاق گاز", "appliance", "کرج", "کرمان", 1050, 210, 3.5, 9_800_000),
]


def seed() -> None:
    with Session(engine) as s:
        if s.exec(select(User)).first():
            return
        carriers = []
        for phone, name, city, vehicle, rating, trips in CARRIERS:
            u = User(phone=phone, name=name, city=city, vehicle=vehicle, rating=rating, trips=trips,
                     role="carrier", verified=True, password_hash=hash_password("shiply1234"))
            s.add(u)
            carriers.append(u)
        shippers = []
        for phone, name, city in SHIPPERS:
            u = User(phone=phone, name=name, city=city, role="shipper", verified=True,
                     password_hash=hash_password("shiply1234"))
            s.add(u)
            shippers.append(u)
        s.commit()
        for u in carriers + shippers:
            s.refresh(u)

        random.seed(21)
        for i, (title, cat, o, d, km, kg, m3, budget) in enumerate(LOADS):
            sh = Shipment(owner_id=shippers[i % len(shippers)].id, title=title, category=cat, origin=o,
                          destination=d, distance_km=km, weight_kg=kg, volume_m3=m3, budget=budget,
                          needs_loader=i % 3 == 0, needs_packing=i % 4 == 0, insured=i % 2 == 0,
                          pickup_from="1405-07-0%d" % (i % 9 + 1), pickup_to="1405-07-1%d" % (i % 9 + 1),
                          description="بارگیری از طبقه همکف امکان‌پذیر است. هماهنگی تلفنی پیش از حرکت الزامی است.")
            s.add(sh)
            s.commit()
            s.refresh(sh)
            for c in random.sample(carriers, random.randint(2, 5)):
                s.add(Bid(shipment_id=sh.id, carrier_id=c.id,
                          amount=int(budget * random.uniform(0.52, 0.93) / 100_000) * 100_000,
                          eta_days=random.randint(1, 4),
                          message="ظرفیت خالی در مسیر برگشت دارم؛ بیمه بار بر عهده ماست."))
        s.commit()
