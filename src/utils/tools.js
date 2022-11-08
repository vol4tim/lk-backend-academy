export function checkCorrectAnswers(user, correct, any = null) {
  if (any) {
    any = any.map((item) => item.toString());
  }
  let corrects = 0;
  for (let question in user) {
    if (any !== null && any.includes(question)) {
      corrects += 1;
      continue;
    }
    if (typeof correct[question] === "string") {
      if (user[question] === correct[question]) {
        corrects += 1;
      }
    } else if (typeof user[question] === "object") {
      const difference = user[question]
        .filter((x) => !correct[question].includes(x))
        .concat(correct[question].filter((x) => !user[question].includes(x)));
      if (difference.length === 0) {
        corrects += 1;
      }
    }
  }
  return corrects;
}
