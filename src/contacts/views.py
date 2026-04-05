# from django.http import HttpResponseRedirect
import json

from django.conf import settings
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .models import Contact
from .form import ContactForm

# # Create your views here.

from django.views.generic import (
    CreateView,
    ListView,
    DetailView,
    UpdateView,
    DeleteView,
)


class ContactCreateView(CreateView):
    template_name = "contacts/contact_create.html"
    form_class = ContactForm
    queryset = Contact.objects.all()

    def form_valid(self, form):
        print(form.cleaned_data)
        return super().form_valid(form)


class ContactListView(ListView):
    template_name = "contacts/contact_list.html"
    # queryset = Contact.objects.all()

    def get_queryset(self):
        search = self.request.GET.get("search")
        if search:
            contacts = Contact.objects.filter(name__startswith=search)
        else:
            contacts = Contact.objects.all()
        return contacts


class ContactDetailView(DetailView):
    template_name = "contacts/contact_detail.html"

    def get_object(self):
        id_ = self.kwargs.get("id")
        return get_object_or_404(Contact, id=id_)


class ContactUpdateView(UpdateView):
    template_name = "contacts/contact_create.html"
    form_class = ContactForm
    queryset = Contact.objects.all()

    def get_object(self):
        id_ = self.kwargs.get("id")
        return get_object_or_404(Contact, id=id_)

    def form_valid(self, form):
        print(form.cleaned_data)
        return super().form_valid(form)


class ContactDeleteView(DeleteView):
    template_name = "contacts/contact_delete.html"

    def get_object(self):
        id_ = self.kwargs.get("id")
        return get_object_or_404(Contact, id=id_)

    def get_success_url(self):
        return reverse("contacts:contact-list")


def serialize_contact(contact):
    return {
        "id": contact.id,
        "name": contact.name,
        "number": contact.number,
        "message": contact.message,
        "detail_url": reverse("contacts:contact-detail", kwargs={"id": contact.id}),
    }


def parse_json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON payload.")


def get_allowed_origin(request):
    origin = request.headers.get("Origin")
    if origin and origin in getattr(settings, "CORS_ALLOWED_ORIGINS", []):
        return origin
    return None


def with_cors_headers(request, response):
    origin = get_allowed_origin(request)
    if not origin:
        return response

    response["Access-Control-Allow-Origin"] = origin
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    response["Vary"] = "Origin"
    return response


def cors_preflight_response(request):
    return with_cors_headers(request, HttpResponse(status=204))


@ensure_csrf_cookie
def contact_app_view(request):
    return render(request, "contacts/contact_app.html", {})


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def contact_api_collection(request):
    if request.method == "OPTIONS":
        return cors_preflight_response(request)

    if request.method == "GET":
        search = request.GET.get("search", "").strip()
        queryset = Contact.objects.all().order_by("-id")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(number__icontains=search)
                | Q(message__icontains=search)
            )
        return with_cors_headers(
            request,
            JsonResponse({"contacts": [serialize_contact(contact) for contact in queryset]}),
        )

    try:
        payload = parse_json_body(request)
    except ValueError as exc:
        return with_cors_headers(
            request,
            JsonResponse({"errors": {"__all__": [str(exc)]}}, status=400),
        )

    form = ContactForm(payload)
    if not form.is_valid():
        return with_cors_headers(
            request,
            JsonResponse({"errors": form.errors}, status=400),
        )

    contact = form.save()
    return with_cors_headers(
        request,
        JsonResponse({"contact": serialize_contact(contact)}, status=201),
    )


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE", "OPTIONS"])
def contact_api_detail(request, id):
    if request.method == "OPTIONS":
        return cors_preflight_response(request)

    contact = get_object_or_404(Contact, id=id)

    if request.method == "GET":
        return with_cors_headers(
            request,
            JsonResponse({"contact": serialize_contact(contact)}),
        )

    if request.method == "DELETE":
        contact.delete()
        return with_cors_headers(request, JsonResponse({"deleted": id}))

    try:
        payload = parse_json_body(request)
    except ValueError as exc:
        return with_cors_headers(
            request,
            JsonResponse({"errors": {"__all__": [str(exc)]}}, status=400),
        )

    form = ContactForm(payload, instance=contact)
    if not form.is_valid():
        return with_cors_headers(
            request,
            JsonResponse({"errors": form.errors}, status=400),
        )

    contact = form.save()
    return with_cors_headers(
        request,
        JsonResponse({"contact": serialize_contact(contact)}),
    )


# def contact_create_view(request):
#     if request.method == "GET":
#         form = ContactForm()
#         context = {"form": form}
#     else:
#         form = ContactForm(request.POST)
#         if form.is_valid():
#             form.save()
#         else:
#             context = {"form": form}
#             return render(request, "contacts/contact_create.html", context)
#         context = {"form": ContactForm()}
#         return redirect(
#             reverse("contacts:contact-list")
#         )  # is line se contact save karne par list view
#     return render(request, "contacts/contact_create.html", context)


# def contact_list_view(request):
#     search = request.GET.get("search")
#     if search:
#         contacts = Contact.objects.filter(name__startswith=search)
#     else:
#         contacts = Contact.objects.all()
#     context = {"contacts": contacts}
#     return render(request, "contacts/contact_list.html", context)


# def contact_detail_view(request, id):
#     obj = get_object_or_404(Contact, id=id)
#     context = {"object": obj}
#     return render(request, "contacts/contact_detail.html", context)

#     # obj = Contact.objects.get(id=id)
#     # context = {"name": obj.name, "message": obj.message, "number": obj.number}


# def contact_update_view(request, id):
#     obj = get_object_or_404(Contact, id=id)
#     if request.method == "GET":
#         form = ContactForm(instance=obj)
#         context = {
#             "form": form,
#             "id": obj.id,
#         }
#         return render(request, "contacts/contact_update.html", context)
#     else:
#         form = ContactForm(request.POST, instance=obj)
#         if form.is_valid():
#             form.save()
#         return redirect(reverse("contacts:contact-detail", kwargs={"id": obj.id}))


# def contact_delete_view(request, id):
#     obj = get_object_or_404(Contact, id=id)
#     if request.method == "POST":
#         print("post method")
#         obj.delete()
#         return redirect(reverse("contacts:contact-list"))
#     else:
#         print("get method")
#         context = {"obj": obj}
#         return render(request, "contacts/contact_delete.html", context)
