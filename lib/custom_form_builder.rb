class CustomFormBuilder < ActionView::Helpers::FormBuilder
  def wrap_field(attribute, options = {}, &block)
    klass = ['form__field']
    klass << 'form__field--invalid' if object && object.errors[attribute].any?
    @template.content_tag(:div, class: klass) do
      @template.label(@object_name, attribute) +
      @template.capture(&block) +
      if object && object.errors[attribute].any?
        @template.content_tag(:div, object.errors[attribute].first, class: 'form__message')
      elsif options[:helper_text]
        @template.content_tag(:div, objectify_options(options[:helper_text]), class: 'form__message')
      end
    end
  end

  [:text_field, :password_field].each do |method|
    define_method(method) do |attribute, options = {}|
      wrap_field(attribute, objectify_options(options)) do
        super(attribute, objectify_options(options))
      end
    end
  end
end
