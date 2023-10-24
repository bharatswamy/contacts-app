"""mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from .views import (
    ContactCreateView,
    ContactDetailView,
    ContactDeleteView,
    ContactUpdateView,
    ContactListView,
)

# from pages.views import home_view, about_view, contact_view
# from contacts.views import (
#     contact_create_view,
#     contact_list_view,
#     contact_detail_view,
#     contact_update_view,
#     contact_delete_view,
# )

app_name = "contacts"

urlpatterns = [
    path("", ContactListView.as_view(), name="contact-list"),
    path("<int:id>/", ContactDetailView.as_view(), name="contact-detail"),
    path("create/", ContactCreateView.as_view(), name="contact-create"),
    path("<int:id>/update/", ContactUpdateView.as_view(), name="contact-update"),
    path("<int:id>/delete/", ContactDeleteView.as_view(), name="contact-delete"),
]

# urlpatterns = [
#     path("", contact_list_view, name="contact-list"),
#     path("create/", contact_create_view, name="contact-create"),
#     path(
#         "detail/<int:id>", contact_detail_view, name="contact-detail"
#     ),  # id bhi argument me pass karni padegi``
#     path("update/<int:id>", contact_update_view, name="contact-update"),
#     path("delete/<int:id>", contact_delete_view, name="delete-contact"),
# ]
