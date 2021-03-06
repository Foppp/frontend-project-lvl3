const parseXml = (data) => {
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(data, 'application/xml');
  const parsererror = xmlData.querySelector('parsererror');
  if (parsererror) {
    throw new Error('xml not valid');
  }
  return xmlData;
};

export default parseXml;
