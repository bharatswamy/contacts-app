from django import forms

from .models import Contact


class ContactForm(forms.ModelForm):
    name = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Contact name"})
    )
    message = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"placeholder": "About Contact User"}),
    )
    number = forms.CharField(
        widget=forms.Textarea(attrs={"placeholder": "contact number"})
    )

    class Meta:
        model = Contact
        fields = ("name", "number", "message")

    def clean_name(self):
        name = self.cleaned_data.get("name")
        if not name[0].isalpha():
            raise forms.ValidationError("Should start from a charater")
        if not name[0].isupper():
            raise forms.ValidationError("First letter should be capital")
        return name
