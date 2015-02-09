var Compiler = require('./Compiler.js');

/*

  List of supported helpers

  ==================
  if statements
  ==================

  $.if(isFalse => {expression}, ...)
  $.if(isTrue => {expression}, ...)
  $.if(isNull => {expression}, ...)
  $.if(isZero => {expression}, ...)
  $.if(isEmpty => {expression}, ...)
  $.if(isArray => {expression}, ...)
  $.if(isNumber => {expression}, ...)
  $.if(isString => {expression}, ...)

  ==================
  loop statements
  ==================

  $.for(in => array, (key, array) => [...])
  $.for(increment => [startNumber, endNumber, amount], (iterator) => [...])
  $.for(each => items, (item, index, array) => [...])
  $.do(while => {expression}, ...)
  $.do(until => {expression}, ...)

  ==================
  text filters/formatters
  ==================

  $.text(escape => {expression}, [hinting...]) //escapes all html
  $.text(html => {expression}, [hinting...]) //allows safe html
  $.text(none => {expression}, [hinting...]) //no stripping

*/

class TemplateHelper {

  constructor(comp) {
    this._comp = comp;
  }

  process(node) {
    var i = 0,
        j = 0,
        items = [],
        children = [],
        template = {},
        bounds = [];
  	if(node.$type === "if") {
  		if(node.$expression() === node.$condition) {
  			return node.$toRender;
  		} else {
  			return null;
  		}
    } else if(node.$type === "render") {
      return {
        component: node.$component,
        data: {
          props: node.$data,
          tag: node.$tag
        }
      };
  	} else if(node.$type === "text") {
      //check for formatters
  		return node.$toRender() + "";
    } else if(node.$type === "forEach") {
      items = node.$items();
      children = [];
      for(i = 0; i < items.length; i++) {
        template = node.$toRender.call(this._comp, items[i], i, items);
        for(j = 0; j < template.length; j++) {
          Compiler.compileDsl.call(this._comp, template[j], children, 0);
        }
      }
      return children;
    } else if(node.$type === "for") {
      bounds = node.$bounds();
      children = [];
      for(i = bounds[0]; i < bounds[1]; i = i + bounds[2]) {
        template = node.$toRender.call(this._comp, i);
        for(j = 0; j < template.length; j++) {
          Compiler.compileDsl.call(this._comp, template[j], children, 0);
        }
      }
      return children;
    }
  	return null;
  }

  for(values, children) {
    var condition = this._getParamNames(arguments[0])[0];

    switch(condition) {
      case "each":
        return {
          $type: "for",
          condition: "each",
          items: values,
          children: children
        }
      case "increment":
        return {
          $type: "for",
          condition: "increment",
          bounds: values,
          children: children
        }
    }
  }

  text(children) {
    return {
      $type: "text",
      condition: this._getParamNames(arguments[0])[0],
      $toRender: children
    }
  }

  render(tag, component, data) {
    return {
      $type: "render",
      $tag: tag,
      $data: data,
      $component: component
    }
  }

  if(expression) {
    return {
      $type: "if",
      condition: this._getParamNames(arguments[0])[0],
      expression: expression,
      children: arguments[1]
    }
  }

  _getParamNames(fn) {
      var funStr = fn.toString();
      return funStr.slice(funStr.indexOf('(') + 1, funStr.indexOf(')')).match(/([^\s,]+)/g);
  }


};

module.exports = TemplateHelper;
