# [CharField] the name of a city. length <=200 chars| default: "New York"
# [CharField] the name of a state. length <=200 chars| default: "New York"
# [Decimal] latitude of location. + is N, - is S. Rounded to 4 places
# [Decimal] longitude of location. + is E, - is W. Rounded to 4 places
from news.models import Location
from decimal import Decimal

LOCATIONS = [
    ('Rochester', 'New York', Decimal(43.1566), Decimal(-77.6088)),
    ('New York', 'New York', Decimal(40.7306), Decimal(-73.9352)),
    ('Philadelphia', 'Pennsylvania', Decimal(39.9526), Decimal(-75.1652)),
    ('Toledo', 'Ohio', Decimal(41.6510), Decimal(-83.5419)),
    ('Ontario', 'Canada', Decimal(34.0689), Decimal(-117.6512)),
    ('Boston', 'Massachusetts', Decimal(42.3611), Decimal(-71.0571)),
    ('Seneca Falls', 'New York', Decimal(42.9106), Decimal(-76.7966)),
    ('Washington', 'DC', Decimal(38.9072), Decimal(-77.0369))
]


def wipeLocations():
    Location.objects.all().delete()


def buildLocation(city, state, lat, lng):
    return Location(city=city, state=state, latitude=lat, longitude=lng)


def importLocations():
    locations = []
    for loc in LOCATIONS:
        locations.append(buildLocation(loc[0], loc[1], loc[2], loc[3]))
    Location.objects.bulk_create(locations)


def qRun():
    wipeLocations()
    importLocations()


def main():
    qRun()


if __name__ == '__main__':
    main()
