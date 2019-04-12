var os = require('os')

module.exports = {
  generate: generate
}

/*
 * Example classes:
  [
    {
      "name": "container",
      "properties": [
        {
            "property": "max-width: 576px",
            "mediaQuery": "@media (min-width: 576px)"
        },
        {
            "property": "max-width: 768px",
            "mediaQuery": "@media (min-width: 768px)"
        }
      ]
    }
  ]
*/

// - create Rust struct definition and one its instance
// - fields are &str
// - see EXAMPLE CODE:
//     `/tests/rust_generator_test/rust_generator.basic.expected_output`
function generate (classes) {
  classes = addEscapedNames(classes)
  return os.EOL +
    generateWarning() +
    os.EOL +
    os.EOL +
    generateAttributes() +
    os.EOL +
    generateStructDefinition(classes) +
    os.EOL +
    os.EOL +
    generateStructInstance(classes) +
    os.EOL
}

/* Add field `escapedName` into class model
 * Example:
 {
        "name": "w-3/5",
        "escapedName": "w_3of5",
        "properties": [
            {
                "property": "width: 60%",
                "mediaQuery": null
            }
        ]
    },
 */
function addEscapedNames (classes) {
  return classes.map(function (class_) {
    class_.escapedName = escapeClassName(class_.name)
    return class_
  })
}

// Rust doesn't allow to use any string as a field name
function escapeClassName (name) {
  name = name.replace(/-/g, '_')
  name = name.replace(/:/g, '__')
  name = name.replace(/\//g, 'of')
  if (getKeywords().indexOf(name) > -1) {
    name += '_'
  }
  return name
}

function generateWarning () {
  return '// DO NOT EDIT THIS FILE - IT\'S GENERATED, CHANGES WILL BE LOST!'
}

// You probably won't use all classes (dead_code)
// and all fields will probably not follow snake_case notation (non_snake_case)
function generateAttributes () {
  return '#[allow(non_snake_case, dead_code)]'
}

function generateStructDefinition (classes) {
  return 'pub struct CssClasses<\'a> {' + os.EOL +
    classes.map(generateStructDefinitionItem).join('') +
    '}'
}

function generateStructDefinitionItem (class_) {
  return generateComment(class_) +
    '    pub ' + class_.escapedName + ': &\'a str,' + os.EOL
}

function generateStructInstance (classes) {
  return 'pub const C: CssClasses<\'static> = CssClasses {' + os.EOL +
    classes.map(generateStructInstanceItem).join('') +
    '};'
}

function generateStructInstanceItem (class_) {
  return generateComment(class_) +
    '    ' + class_.escapedName + ': "' +
    class_.name + '",' + os.EOL
}

function generateComment (class_) {
  return os.EOL + '    /**' + os.EOL +
    class_.properties.map(generateCommentItem).join('') + '    */' + os.EOL
}

function generateCommentItem (classProperty) {
  var mediaQuery = ''
  if (classProperty.mediaQuery) {
    mediaQuery = '    ' + classProperty.mediaQuery
  }
  var property = classProperty.property
  return '        ' + property + ';' + mediaQuery + os.EOL
}

// https://doc.rust-lang.org/book/appendix-01-keywords.html
function getKeywords () {
  return [
    'as',
    'break',
    'const',
    'continue',
    'crate',
    'dyn',
    'else',
    'enum',
    'extern',
    'false',
    'fn',
    'for',
    'if',
    'impl',
    'in',
    'let',
    'loop',
    'match',
    'mod',
    'move',
    'mut',
    'pub',
    'ref',
    'return',
    'Self',
    'self',
    'static',
    'struct',
    'super',
    'trait',
    'true',
    'type',
    'unsafe',
    'use',
    'where',
    'while',

    'abstract',
    'async',
    'become',
    'box',
    'do',
    'final',
    'macro',
    'override',
    'priv',
    'try',
    'typeof',
    'unsized',
    'virtual',
    'yield'
  ]
}
