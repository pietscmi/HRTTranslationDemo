const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');


/**
 * Helper 
 * @param {*} errorMessage 
 * @param {*} defaultLanguage 
 */
function getTheErrorResponse(errorMessage, defaultLanguage) {
  return {
    statusCode: 200,
    body: {
      language: defaultLanguage || 'en',
      errorMessage: errorMessage
    }
  };
}

/**
  *
  * main() will be run when teh action is invoked
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {

  /*
   * The default language to choose in case of an error
   */
  const defaultLanguage = 'en';

  return new Promise(function (resolve, reject) {
    console.log(params);
    try {

      const languageTranslator = new LanguageTranslatorV3({
        version: '2018-05-01',
        authenticator: new IamAuthenticator({
          apikey: params.apikey,
        }),
        url: params.url,
      });

      const defaultParams = {
        text: 'Translator could not recognise the input values. Printing and translating this default string to spain ',
        modelId: 'en-es',
      };

      var objWithParams;
      if (params !== undefined && 'text' in params.body && params.body.text !== undefined && params.body.text !== null
          && 'language' in params.body && params.body.language !== undefined && params.body.language !== null) {
        objWithParams = params.body;
        objWithParams.modelId = '' + params.body.language + '-en';
      } else {
        console.log("Translating default text");
        objWithParams = defaultParams;
      }

      languageTranslator.translate(objWithParams)
          .then(translationResult => {
            console.log(JSON.stringify(translationResult, null, 2));
            resolve({
              statusCode: 200,
              body: {
                originText: objWithParams.text,
                translations: translationResult.result.translations[0].translation,
                words: translationResult.result.word_count,
                characters: translationResult.result.character_count,
              },
              headers: { 'Content-Type': 'application/json' }
            });
          })
          .catch(err => {
            console.log('error:', err);
            resolve(getTheErrorResponse('Could not translate text', defaultLanguage));
          });

         
    } catch (err) {
      console.error('Error while initializing the AI service', err);
      resolve(getTheErrorResponse('Error while communicating with the language service', defaultLanguage));
    }
  });
}
