module ApplicationHelper
  def custom_form_with(model: nil, scope: nil, url: nil, format: nil, **options, &block)
    options.merge!(builder: CustomFormBuilder)
    options[:html] ||= {}
    options[:html].merge!(class: 'form')
    form_with(model: model, scope: scope, url: url, format: format, **options, &block)
  end
end
