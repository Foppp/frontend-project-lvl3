const parseXml = (data) => {
  const parser = new DOMParser();
  const xmlData = parser.parseFromString(data, 'application/xml');
  return xmlData;
};

export default parseXml;
