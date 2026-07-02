const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const documentsSource = fs.readFileSync(
	path.join(__dirname, '..', 'js', 'documents.js'),
	'utf8'
);

const context = {
	console
};

vm.createContext(context);
vm.runInContext(`${documentsSource}\nthis.Documents = Documents;`, context);

const { Documents } = context;

assert.equal(typeof Documents.getSeoData, 'function', 'Documents.getSeoData should exist');
assert.equal(typeof Documents.slugify, 'function', 'Documents.slugify should exist');

const settings = {
	site_name: 'myshop.ru',
	full_name: 'Иванов Иван Иванович'
};

const offerSeo = Documents.getSeoData('offer', settings);
const offerSeoWithOtherSettings = Documents.getSeoData('offer', {
	site_name: 'shop.example',
	full_name: 'ООО Ромашка'
});

assert.equal(offerSeo.articleTitle, 'Публичная оферта');
assert.equal(offerSeo.metaH1, 'Публичная оферта');
assert.equal(offerSeo.seoUrl, 'publichnaya-oferta');
assert.equal(
	offerSeoWithOtherSettings.seoUrl,
	offerSeo.seoUrl,
	'SEO URL should stay static for predefined legal pages'
);
assert.match(
	offerSeo.metaTitle,
	/Публичная оферта интернет-магазина myshop\.ru/i,
	'meta title should naturally include the user site name'
);
assert.match(
	offerSeo.metaDescription,
	/myshop\.ru/i,
	'meta description should include the user site name'
);

assert.equal(
	Documents.slugify('Политика обработки персональных данных'),
	'politika-obrabotki-personalnykh-dannykh'
);

assert.equal(
	Documents.slugify('  Согласие   на рассылку  '),
	'soglasie-na-rassylku'
);

console.log('SEO metadata tests passed');
