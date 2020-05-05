class CustomFormBuilder < ActionView::Helpers::FormBuilder
  def wrap_field(attribute, options = {})
    klass = ['form__field']
    klass << 'form__field--invalid' if object && object.errors[attribute].any?
    @template.content_tag(:div, class: klass) do
      @template.label(@object_name, attribute) +
      yield +
      if object && object.errors[attribute].any?
        @template.content_tag(:div, object.errors[attribute].first, class: 'form__message')
      elsif options[:helper_text]
        @template.content_tag(:div, options[:helper_text], class: 'form__message')
      end
    end
  end

  [:text_field, :password_field].each do |method|
    define_method(method) do |attribute, options = {}|
      wrap_field(attribute, options) do
        super(attribute, options)
      end
    end
  end
end
