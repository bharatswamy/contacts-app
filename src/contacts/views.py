# from django.http import HttpResponseRedirect
from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse

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
        print(form.cleand_data)
        return super().form_valid(form)


class ContactDeleteView(DeleteView):
    template_name = "contacts/contact_delete.html"

    def get_object(self):
        id_ = self.kwargs.get("id")
        return get_object_or_404(Contact, id=id_)

    def get_success_url(self):
        return reverse("contacts:contact-list")


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
