"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jszip = require("jszip");

var _jszip2 = _interopRequireDefault(_jszip);

var _cheerio = require("cheerio");

var _cheerio2 = _interopRequireDefault(_cheerio);

var _htmlparser = require("htmlparser2");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  document parser
 *
 *  @example
 *  Document.load(file)
 *  	.then(doc=>doc.parse())
 */
var ZipDocument = function () {
	function ZipDocument(parts, raw, props) {
		_classCallCheck(this, ZipDocument);

		this.parts = parts;
		this.raw = raw;
		this.props = props;
		this._shouldReleased = new Map();
	}

	_createClass(ZipDocument, [{
		key: "getPart",
		value: function getPart(name) {
			return this.parts[name];
		}
	}, {
		key: "getDataPart",
		value: function getDataPart(name) {
			var part = this.parts[name];
			var crc32 = part._data.crc32;
			var data = part.asUint8Array(); //unsafe call, part._data is changed
			data.crc32 = part._data.crc32 = crc32; //so keep crc32 on part._data for future
			return data;
		}
	}, {
		key: "getDataPartAsUrl",
		value: function getDataPartAsUrl(name) {
			var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "*/*";

			var part = this.parts[name];
			var crc32 = part._data.crc32;
			if (!this._shouldReleased.has(crc32)) {
				this._shouldReleased.set(crc32, URL.createObjectURL(new Blob([this.getDataPart(name)], { type: type })));
			}
			return this._shouldReleased.get(crc32);
		}
	}, {
		key: "getPartCrc32",
		value: function getPartCrc32(name) {
			var part = this.parts[name];
			var crc32 = part._data.crc32;
			return crc32;
		}
	}, {
		key: "release",
		value: function release() {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = this._shouldReleased[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var _step$value = _slicedToArray(_step.value, 2),
					    url = _step$value[1];

					URL.revokeObjectURL(url);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}, {
		key: "getObjectPart",
		value: function getObjectPart(name) {
			var part = this.parts[name];
			if (!part) return null;else if (part.cheerio) return part;else return this.parts[name] = this.constructor.parseXml(part.asText());
		}
	}, {
		key: "parse",
		value: function parse(domHandler) {}
	}, {
		key: "render",
		value: function render() {}
	}, {
		key: "serialize",
		value: function serialize() {
			var _this = this;

			var newDoc = new _jszip2.default();
			Object.keys(this.parts).forEach(function (path) {
				var part = _this.parts[path];
				if (part.cheerio) {
					newDoc.file(path, part.xml());
				} else {
					newDoc.file(path, part._data, part.options);
				}
			});
			return newDoc;
		}
	}, {
		key: "save",
		value: function save(file, options) {
			file = file || this.props.name || Date.now() + ".docx";

			var newDoc = this.serialize();

			if (typeof document != "undefined" && window.URL && window.URL.createObjectURL) {
				var data = newDoc.generate(_extends({}, options, { type: "blob", mimeType: this.constructor.mime }));
				var url = window.URL.createObjectURL(data);
				var link = document.createElement("a");
				document.body.appendChild(link);
				link.download = file;
				link.href = url;
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			} else {
				var _ret = function () {
					var data = newDoc.generate(_extends({}, options, { type: "nodebuffer" }));
					return {
						v: new Promise(function (resolve, reject) {
							return require("f" + "s").writeFile(file, data, function (error) {
								error ? reject(error) : resolve(data);
							});
						})
					};
				}();

				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
			}
		}
	}, {
		key: "clone",
		value: function clone() {
			var _this2 = this;

			var zip = new _jszip2.default();
			var props = props ? JSON.parse(JSON.stringify(this.props)) : props;
			var parts = Object.keys(this.parts).reduce(function (state, k) {
				var v = _this2.parts[k];
				if (v.cheerio) {
					state[k] = _this2.constructor.parseXml(v.xml());
				} else {
					zip.file(v.name, v._data, v.options);
					state[k] = zip.file(v.name);
				}
				return state;
			}, {});
			return new this.constructor(parts, zip, props);
		}

		/**
   *  a helper to load document file
  
   *  @param inputFile {File} - a html input file, or nodejs file
   *  @return {Promise}
   */

	}], [{
		key: "load",
		value: function load(inputFile) {
			var DocumentSelf = this;

			if (inputFile instanceof ZipDocument) return Promise.resolve(inputFile);

			return new Promise(function (resolve, reject) {
				function parse(data) {
					var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

					try {
						(function () {
							var raw = new _jszip2.default(data),
							    parts = {};
							raw.filter(function (path, file) {
								return parts[path] = file;
							});
							resolve(new DocumentSelf(parts, raw, props));
						})();
					} catch (error) {
						reject(error);
					}
				}

				if (typeof inputFile == 'string') {
					//file name
					require('fs').readFile(inputFile, function (error, data) {
						if (error) reject(error);else if (data) {
							parse(data, { name: inputFile.split(/[\/\\]/).pop().replace(/\.docx$/i, '') });
						}
					});
				} else if (inputFile instanceof Blob) {
					var reader = new FileReader();
					reader.onload = function (e) {
						parse(e.target.result, inputFile.name ? {
							name: inputFile.name.replace(/\.docx$/i, ''),
							lastModified: inputFile.lastModified,
							size: inputFile.size
						} : { size: inputFile.size });
					};
					reader.readAsArrayBuffer(inputFile);
				} else {
					parse(inputFile);
				}
			});
		}
	}, {
		key: "create",
		value: function create() {
			return this.load(__dirname + "/../templates/blank." + this.ext);
		}
	}, {
		key: "parseXml",
		value: function parseXml(data) {
			try {
				var opt = { xmlMode: true, decodeEntities: false };
				var handler = new ContentDomHandler(opt);
				new _htmlparser.Parser(handler, opt).end(data);
				var parsed = _cheerio2.default.load(handler.dom, opt);
				if (typeof parsed.cheerio == "undefined") parsed.cheerio = "customized";
				return parsed;
			} catch (error) {
				console.error(error);
				return null;
			}
		}
	}]);

	return ZipDocument;
}();

ZipDocument.ext = "unknown";
ZipDocument.mime = "application/zip";
exports.default = ZipDocument;

var ContentDomHandler = function (_DomHandler) {
	_inherits(ContentDomHandler, _DomHandler);

	function ContentDomHandler() {
		_classCallCheck(this, ContentDomHandler);

		return _possibleConstructorReturn(this, (ContentDomHandler.__proto__ || Object.getPrototypeOf(ContentDomHandler)).apply(this, arguments));
	}

	_createClass(ContentDomHandler, [{
		key: "_addDomElement",
		value: function _addDomElement(el) {
			if (el.type == "text" && (el.data[0] == '\r' || el.data[0] == '\n')) ; //remove format whitespaces
			else return _get(ContentDomHandler.prototype.__proto__ || Object.getPrototypeOf(ContentDomHandler.prototype), "_addDomElement", this).call(this, el);
		}
	}]);

	return ContentDomHandler;
}(_htmlparser.DomHandler);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6WyJaaXBEb2N1bWVudCIsInBhcnRzIiwicmF3IiwicHJvcHMiLCJfc2hvdWxkUmVsZWFzZWQiLCJNYXAiLCJuYW1lIiwicGFydCIsImNyYzMyIiwiX2RhdGEiLCJkYXRhIiwiYXNVaW50OEFycmF5IiwidHlwZSIsImhhcyIsInNldCIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsIkJsb2IiLCJnZXREYXRhUGFydCIsImdldCIsInVybCIsInJldm9rZU9iamVjdFVSTCIsImNoZWVyaW8iLCJjb25zdHJ1Y3RvciIsInBhcnNlWG1sIiwiYXNUZXh0IiwiZG9tSGFuZGxlciIsIm5ld0RvYyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwicGF0aCIsImZpbGUiLCJ4bWwiLCJvcHRpb25zIiwiRGF0ZSIsIm5vdyIsInNlcmlhbGl6ZSIsImRvY3VtZW50Iiwid2luZG93IiwiZ2VuZXJhdGUiLCJtaW1lVHlwZSIsIm1pbWUiLCJsaW5rIiwiY3JlYXRlRWxlbWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImRvd25sb2FkIiwiaHJlZiIsImNsaWNrIiwicmVtb3ZlQ2hpbGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlcXVpcmUiLCJ3cml0ZUZpbGUiLCJlcnJvciIsInppcCIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsInJlZHVjZSIsInN0YXRlIiwiayIsInYiLCJpbnB1dEZpbGUiLCJEb2N1bWVudFNlbGYiLCJmaWx0ZXIiLCJyZWFkRmlsZSIsInNwbGl0IiwicG9wIiwicmVwbGFjZSIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJlIiwidGFyZ2V0IiwicmVzdWx0IiwibGFzdE1vZGlmaWVkIiwic2l6ZSIsInJlYWRBc0FycmF5QnVmZmVyIiwibG9hZCIsIl9fZGlybmFtZSIsImV4dCIsIm9wdCIsInhtbE1vZGUiLCJkZWNvZGVFbnRpdGllcyIsImhhbmRsZXIiLCJDb250ZW50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U25GLFcsQ0FFYjBDLEksR0FBSyxpQjtrQkFGUTFDLFc7O0lBd0xmd0YsaUI7Ozs7Ozs7Ozs7O2lDQUNVSyxFLEVBQUc7QUFDakIsT0FBR0EsR0FBR2pGLElBQUgsSUFBUyxNQUFULEtBQW9CaUYsR0FBR25GLElBQUgsQ0FBUSxDQUFSLEtBQVksSUFBWixJQUFvQm1GLEdBQUduRixJQUFILENBQVEsQ0FBUixLQUFZLElBQXBELENBQUgsRUFDQyxDQURELENBQ0U7QUFERixRQUdDLDRJQUE0Qm1GLEVBQTVCO0FBQ0QiLCJmaWxlIjoiZG9jdW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgSlNaaXAsIHtaaXBPYmplY3R9IGZyb20gJ2pzemlwJ1xyXG5pbXBvcnQgY2hlZXIgZnJvbSBcImNoZWVyaW9cIlxyXG5pbXBvcnQge1BhcnNlciwgRG9tSGFuZGxlcn0gZnJvbSBcImh0bWxwYXJzZXIyXCJcclxuXHJcbi8qKlxyXG4gKiAgZG9jdW1lbnQgcGFyc2VyXHJcbiAqXHJcbiAqICBAZXhhbXBsZVxyXG4gKiAgRG9jdW1lbnQubG9hZChmaWxlKVxyXG4gKiAgXHQudGhlbihkb2M9PmRvYy5wYXJzZSgpKVxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWmlwRG9jdW1lbnR7XHJcblx0c3RhdGljIGV4dD1cInVua25vd25cIlxyXG5cdHN0YXRpYyBtaW1lPVwiYXBwbGljYXRpb24vemlwXCJcclxuXHJcblx0Y29uc3RydWN0b3IocGFydHMscmF3LHByb3BzKXtcclxuXHRcdHRoaXMucGFydHM9cGFydHNcclxuXHRcdHRoaXMucmF3PXJhd1xyXG5cdFx0dGhpcy5wcm9wcz1wcm9wc1xyXG5cdFx0dGhpcy5fc2hvdWxkUmVsZWFzZWQ9bmV3IE1hcCgpXHJcblx0fVxyXG5cclxuXHRnZXRQYXJ0KG5hbWUpe1xyXG5cdFx0cmV0dXJuIHRoaXMucGFydHNbbmFtZV1cclxuXHR9XHJcblxyXG5cdGdldERhdGFQYXJ0KG5hbWUpe1xyXG5cdFx0bGV0IHBhcnQ9dGhpcy5wYXJ0c1tuYW1lXVxyXG5cdFx0bGV0IGNyYzMyPXBhcnQuX2RhdGEuY3JjMzJcclxuXHRcdGxldCBkYXRhPXBhcnQuYXNVaW50OEFycmF5KCkvL3Vuc2FmZSBjYWxsLCBwYXJ0Ll9kYXRhIGlzIGNoYW5nZWRcclxuXHRcdGRhdGEuY3JjMzI9cGFydC5fZGF0YS5jcmMzMj1jcmMzMi8vc28ga2VlcCBjcmMzMiBvbiBwYXJ0Ll9kYXRhIGZvciBmdXR1cmVcclxuXHRcdHJldHVybiBkYXRhXHJcblx0fVxyXG5cclxuXHRnZXREYXRhUGFydEFzVXJsKG5hbWUsdHlwZT1cIiovKlwiKXtcclxuXHRcdGxldCBwYXJ0PXRoaXMucGFydHNbbmFtZV1cclxuXHRcdGxldCBjcmMzMj1wYXJ0Ll9kYXRhLmNyYzMyXHJcblx0XHRpZighdGhpcy5fc2hvdWxkUmVsZWFzZWQuaGFzKGNyYzMyKSl7XHJcblx0XHRcdHRoaXMuX3Nob3VsZFJlbGVhc2VkLnNldChjcmMzMixVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFt0aGlzLmdldERhdGFQYXJ0KG5hbWUpXSx7dHlwZX0pKSlcclxuXHRcdH1cclxuXHRcdHJldHVybiB0aGlzLl9zaG91bGRSZWxlYXNlZC5nZXQoY3JjMzIpXHJcblx0fVxyXG5cclxuXHRnZXRQYXJ0Q3JjMzIobmFtZSl7XHJcblx0XHRsZXQgcGFydD10aGlzLnBhcnRzW25hbWVdXHJcblx0XHRsZXQgY3JjMzI9cGFydC5fZGF0YS5jcmMzMlxyXG5cdFx0cmV0dXJuIGNyYzMyXHJcblx0fVxyXG5cclxuXHRyZWxlYXNlKCl7XHJcblx0XHRmb3IobGV0IFssIHVybF0gb2YgdGhpcy5fc2hvdWxkUmVsZWFzZWQpe1xyXG5cdFx0XHRVUkwucmV2b2tlT2JqZWN0VVJMKHVybClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGdldE9iamVjdFBhcnQobmFtZSl7XHJcblx0XHRjb25zdCBwYXJ0PXRoaXMucGFydHNbbmFtZV1cclxuXHRcdGlmKCFwYXJ0KVxyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0ZWxzZSBpZihwYXJ0LmNoZWVyaW8pXHJcblx0XHRcdHJldHVybiBwYXJ0XHJcblx0XHRlbHNlXHJcblx0XHRcdHJldHVybiB0aGlzLnBhcnRzW25hbWVdPXRoaXMuY29uc3RydWN0b3IucGFyc2VYbWwocGFydC5hc1RleHQoKSlcclxuXHR9XHJcblx0XHJcblx0cGFyc2UoZG9tSGFuZGxlcil7XHJcblxyXG5cdH1cclxuXHJcblx0cmVuZGVyKCl7XHJcblxyXG5cdH1cclxuXHRcclxuXHRzZXJpYWxpemUoKXtcclxuXHRcdGxldCBuZXdEb2M9bmV3IEpTWmlwKClcclxuXHRcdE9iamVjdC5rZXlzKHRoaXMucGFydHMpLmZvckVhY2gocGF0aD0+e1xyXG5cdFx0XHRsZXQgcGFydD10aGlzLnBhcnRzW3BhdGhdXHJcblx0XHRcdGlmKHBhcnQuY2hlZXJpbyl7XHJcblx0XHRcdFx0bmV3RG9jLmZpbGUocGF0aCxwYXJ0LnhtbCgpKVxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRuZXdEb2MuZmlsZShwYXRoLHBhcnQuX2RhdGEsIHBhcnQub3B0aW9ucylcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHRcdHJldHVybiBuZXdEb2NcclxuXHR9XHJcblxyXG5cdHNhdmUoZmlsZSxvcHRpb25zKXtcclxuXHRcdGZpbGU9ZmlsZXx8dGhpcy5wcm9wcy5uYW1lfHxgJHtEYXRlLm5vdygpfS5kb2N4YFxyXG5cdFx0XHJcblx0XHRsZXQgbmV3RG9jPXRoaXMuc2VyaWFsaXplKClcclxuXHRcdFxyXG5cdFx0aWYodHlwZW9mKGRvY3VtZW50KSE9XCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuVVJMICYmIHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKXtcclxuXHRcdFx0bGV0IGRhdGE9bmV3RG9jLmdlbmVyYXRlKHsuLi5vcHRpb25zLHR5cGU6XCJibG9iXCIsbWltZVR5cGU6dGhpcy5jb25zdHJ1Y3Rvci5taW1lfSlcclxuXHRcdFx0bGV0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGRhdGEpXHJcblx0XHRcdGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluaylcclxuXHRcdFx0bGluay5kb3dubG9hZCA9IGZpbGVcclxuXHRcdFx0bGluay5ocmVmID0gdXJsO1xyXG5cdFx0XHRsaW5rLmNsaWNrKClcclxuXHRcdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKVxyXG5cdFx0XHR3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpXHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0bGV0IGRhdGE9bmV3RG9jLmdlbmVyYXRlKHsuLi5vcHRpb25zLHR5cGU6XCJub2RlYnVmZmVyXCJ9KVxyXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+XHJcblx0XHRcdFx0cmVxdWlyZShcImZcIitcInNcIikud3JpdGVGaWxlKGZpbGUsZGF0YSxlcnJvcj0+e1xyXG5cdFx0XHRcdFx0ZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShkYXRhKVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdClcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNsb25lKCl7XHJcblx0XHRsZXQgemlwPW5ldyBKU1ppcCgpXHJcblx0XHRsZXQgcHJvcHM9IHByb3BzID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnByb3BzKSkgOiBwcm9wc1xyXG5cdFx0bGV0IHBhcnRzPU9iamVjdC5rZXlzKHRoaXMucGFydHMpLnJlZHVjZSgoc3RhdGUsIGspPT57XHJcblx0XHRcdGxldCB2PXRoaXMucGFydHNba11cclxuXHRcdFx0aWYodi5jaGVlcmlvKXtcclxuXHRcdFx0XHRzdGF0ZVtrXT10aGlzLmNvbnN0cnVjdG9yLnBhcnNlWG1sKHYueG1sKCkpXHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdHppcC5maWxlKHYubmFtZSx2Ll9kYXRhLHYub3B0aW9ucylcclxuXHRcdFx0XHRzdGF0ZVtrXT16aXAuZmlsZSh2Lm5hbWUpXHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIHN0YXRlXHJcblx0XHR9LHt9KVxyXG5cdFx0cmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHBhcnRzLHppcCwgcHJvcHMpXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiAgYSBoZWxwZXIgdG8gbG9hZCBkb2N1bWVudCBmaWxlXHJcblxyXG5cdCAqICBAcGFyYW0gaW5wdXRGaWxlIHtGaWxlfSAtIGEgaHRtbCBpbnB1dCBmaWxlLCBvciBub2RlanMgZmlsZVxyXG5cdCAqICBAcmV0dXJuIHtQcm9taXNlfVxyXG5cdCAqL1xyXG5cclxuXHRzdGF0aWMgbG9hZChpbnB1dEZpbGUpe1xyXG5cdFx0Y29uc3QgRG9jdW1lbnRTZWxmPXRoaXNcclxuXHJcblx0XHRpZihpbnB1dEZpbGUgaW5zdGFuY2VvZiBaaXBEb2N1bWVudClcclxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShpbnB1dEZpbGUpXHJcblxyXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XHJcblx0XHRcdGZ1bmN0aW9uIHBhcnNlKGRhdGEsIHByb3BzPXt9KXtcclxuXHRcdFx0XHR0cnl7XHJcblx0XHRcdFx0XHRsZXQgcmF3PW5ldyBKU1ppcChkYXRhKSxwYXJ0cz17fVxyXG5cdFx0XHRcdFx0cmF3LmZpbHRlcigocGF0aCxmaWxlKT0+cGFydHNbcGF0aF09ZmlsZSlcclxuXHRcdFx0XHRcdHJlc29sdmUobmV3IERvY3VtZW50U2VsZihwYXJ0cyxyYXcscHJvcHMpKVxyXG5cdFx0XHRcdH1jYXRjaChlcnJvcil7XHJcblx0XHRcdFx0XHRyZWplY3QoZXJyb3IpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0eXBlb2YgaW5wdXRGaWxlPT0nc3RyaW5nJyl7Ly9maWxlIG5hbWVcclxuXHRcdFx0XHRyZXF1aXJlKCdmcycpLnJlYWRGaWxlKGlucHV0RmlsZSxmdW5jdGlvbihlcnJvciwgZGF0YSl7XHJcblx0XHRcdFx0XHRpZihlcnJvcilcclxuXHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcclxuXHRcdFx0XHRcdGVsc2UgaWYoZGF0YSl7XHJcblx0XHRcdFx0XHRcdHBhcnNlKGRhdGEsIHtuYW1lOmlucHV0RmlsZS5zcGxpdCgvW1xcL1xcXFxdLykucG9wKCkucmVwbGFjZSgvXFwuZG9jeCQvaSwnJyl9KVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdH1lbHNlIGlmKGlucHV0RmlsZSBpbnN0YW5jZW9mIEJsb2Ipe1xyXG5cdFx0XHRcdHZhciByZWFkZXI9bmV3IEZpbGVSZWFkZXIoKTtcclxuXHRcdFx0XHRyZWFkZXIub25sb2FkPWZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdFx0cGFyc2UoZS50YXJnZXQucmVzdWx0LCAoaW5wdXRGaWxlLm5hbWUgPyB7XHJcblx0XHRcdFx0XHRcdFx0bmFtZTppbnB1dEZpbGUubmFtZS5yZXBsYWNlKC9cXC5kb2N4JC9pLCcnKSxcclxuXHRcdFx0XHRcdFx0XHRsYXN0TW9kaWZpZWQ6aW5wdXRGaWxlLmxhc3RNb2RpZmllZCxcclxuXHRcdFx0XHRcdFx0XHRzaXplOmlucHV0RmlsZS5zaXplXHJcblx0XHRcdFx0XHRcdH0gOiB7c2l6ZTppbnB1dEZpbGUuc2l6ZX0pKVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoaW5wdXRGaWxlKTtcclxuXHRcdFx0fWVsc2Uge1xyXG5cdFx0XHRcdHBhcnNlKGlucHV0RmlsZSlcclxuXHRcdFx0fVxyXG5cdFx0fSlcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoKXtcclxuXHRcdHJldHVybiB0aGlzLmxvYWQoYCR7X19kaXJuYW1lfS8uLi90ZW1wbGF0ZXMvYmxhbmsuJHt0aGlzLmV4dH1gKVxyXG5cdH1cclxuXHJcblx0c3RhdGljIHBhcnNlWG1sKGRhdGEpe1xyXG5cdFx0dHJ5e1xyXG5cdFx0XHRsZXQgb3B0PXt4bWxNb2RlOnRydWUsZGVjb2RlRW50aXRpZXM6IGZhbHNlfVxyXG5cdFx0XHRsZXQgaGFuZGxlcj1uZXcgQ29udGVudERvbUhhbmRsZXIob3B0KVxyXG5cdFx0XHRuZXcgUGFyc2VyKGhhbmRsZXIsb3B0KS5lbmQoZGF0YSlcclxuXHRcdFx0bGV0IHBhcnNlZD1jaGVlci5sb2FkKGhhbmRsZXIuZG9tLG9wdClcclxuXHRcdFx0aWYodHlwZW9mKHBhcnNlZC5jaGVlcmlvKT09XCJ1bmRlZmluZWRcIilcclxuXHRcdFx0XHRwYXJzZWQuY2hlZXJpbz1cImN1c3RvbWl6ZWRcIlxyXG5cdFx0XHRyZXR1cm4gcGFyc2VkXHJcblx0XHR9Y2F0Y2goZXJyb3Ipe1xyXG5cdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKVxyXG5cdFx0XHRyZXR1cm4gbnVsbFxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgQ29udGVudERvbUhhbmRsZXIgZXh0ZW5kcyBEb21IYW5kbGVye1xyXG5cdF9hZGREb21FbGVtZW50KGVsKXtcclxuXHRcdGlmKGVsLnR5cGU9PVwidGV4dFwiICYmIChlbC5kYXRhWzBdPT0nXFxyJyB8fCBlbC5kYXRhWzBdPT0nXFxuJykpXHJcblx0XHRcdDsvL3JlbW92ZSBmb3JtYXQgd2hpdGVzcGFjZXNcclxuXHRcdGVsc2VcclxuXHRcdFx0cmV0dXJuIHN1cGVyLl9hZGREb21FbGVtZW50KGVsKVxyXG5cdH1cclxufVxyXG4iXX0=