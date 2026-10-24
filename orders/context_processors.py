from .models import Order
from .views import OPEN_STATUSES, seconds_left


def active_order(request):
    # The student's current token. It replaces the cart in the header until
    # the order is collected, cancelled, or its 30 minutes run out.
    pk = request.session.get('last_order')
    if not pk:
        return {}
    order = Order.objects.filter(pk=pk, status__in=OPEN_STATUSES).first()
    if order is None or seconds_left(order) == 0:
        return {}
    return {'active_order': order}