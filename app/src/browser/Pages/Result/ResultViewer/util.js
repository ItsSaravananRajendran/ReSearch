const getCharacter = (string, length, preAnswer = true) => {
  let result;
  if (preAnswer) {
    const diff = string.length - length - 3;
    if (diff > 0) {
      result = string.substring(diff);
      if (diff > 3) result = "..." + result;
      return result;
    }
  } else {
    if (length > string.length) {
      result = string.substring(0, length);
      if (diff > 3) result = result + "...";
      return result;
    }
  }
  return string;
};

export { getCharacter };
