from django import forms

from .models import Contact


class ContactForm(forms.ModelForm):
    name = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Contact name"})
    )
    message = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={"placeholder": "A few notes about this person"}),
    )
    number = forms.CharField(
        widget=forms.TextInput(attrs={"placeholder": "Phone number"})
    )

    class Meta:
        model = Contact
        fields = ("name", "number", "message")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["name"].widget.attrs.update(
            {"class": "app-input", "autocomplete": "name"}
        )
        self.fields["number"].widget.attrs.update(
            {"class": "app-input", "autocomplete": "tel"}
        )
        self.fields["message"].widget.attrs.update(
            {"class": "app-textarea", "rows": 5}
        )

    def clean_name(self):
        name = self.cleaned_data.get("name")
        if not name[0].isalpha():
            raise forms.ValidationError("Should start from a charater")
        if not name[0].isupper():
            raise forms.ValidationError("First letter should be capital")
        return name
