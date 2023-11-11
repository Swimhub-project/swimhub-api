/*
  "input validation" functions

  The following functions are used to validate various user inputs.
*/

//returns true if the input is a valid user role, else returns false
export const isUserRole = (input: string): boolean => {
  if (input == 'user' || input == 'moderator' || input == 'admin') {
    return true;
  } else return false;
};

//returns true if the input is a valid user status, else returns false
export const isUserStatus = (input: string): boolean => {
  if (
    input == 'inactive' ||
    input == 'active' ||
    input == 'muted' ||
    input == 'banned' ||
    input == 'deleted' ||
    input == 'locked'
  ) {
    return true;
  } else return false;
};

//returns true if the input is the string version of a boolean, else returns false
export const isBoolean = (input: string): boolean => {
  if (input == 'true' || input == 'false') {
    return true;
  } else return false;
};

//returns true if the input can be converted into a number, else returns false
export const isNumber = (input: string): boolean => {
  if (Number.isNaN(parseInt(input))) {
    return false;
  } else return true;
};

//returns true if the input is a valid entry type, else returns false
export const isEntryType = (input: string): boolean => {
  if (input == 'tip' || input == 'exercise' || input == 'lesson_plan') {
    return true;
  } else return false;
};

//returns true if the input is a valid entry stroke, else returns false
export const isEntryStroke = (input: string): boolean => {
  if (
    input == 'frontcrawl' ||
    input == 'backcrawl' ||
    input == 'breastoke' ||
    input == 'butterfly' ||
    input == 'general'
  ) {
    return true;
  } else return false;
};

//returns true if the input is a valid content status, else returns false
export const isContentStatus = (input: string): boolean => {
  if (input == 'public' || input == 'private' || input == 'deleted') {
    return true;
  } else return false;
};

//returns true if the input is a valid entry stage, else returns false
export const isEntryStage = (input: string): boolean => {
  if (
    input == 'stage_1' ||
    input == 'stage_2' ||
    input == 'stage_3' ||
    input == 'stage_4' ||
    input == 'stage_5' ||
    input == 'stage_6' ||
    input == 'stage_7' ||
    input == 'stage_7_plus' ||
    input == 'adult' ||
    input == 'preschool'
  ) {
    return true;
  } else return false;
};

//returns true if the input is a valid log level, else returns false
export const isLogLevel = (input: string): boolean => {
  if (
    input == 'info' ||
    input == 'warn' ||
    input == 'error' ||
    input == 'critical'
  ) {
    return true;
  } else return false;
};

//returns true if the input is a valid request method, else returns false
export const isReqMethod = (input: string): boolean => {
  input = input.toUpperCase();
  if (
    input == 'GET' ||
    input == 'POST' ||
    input == 'PATCH' ||
    input == 'DELETE'
  ) {
    return true;
  } else return false;
};

//returns true if the input is a valid response code, else returns false
export const isResCode = (input: string): boolean => {
  const inputNum = parseInt(input);
  if (
    !isNaN(inputNum) &&
    (inputNum == 200 ||
      inputNum == 201 ||
      inputNum == 400 ||
      inputNum == 401 ||
      inputNum == 403 ||
      inputNum == 409 ||
      inputNum == 429 ||
      inputNum == 500)
  ) {
    return true;
  } else return false;
};

//returns true if the input is a valid url, else returns false
//TODO add more endpoint strings as they are added to the project
export const isEndpoint = (input: string): boolean => {
  if (
    input == 'user' ||
    input == 'entry' ||
    input == 'log' ||
    input == 'session' ||
    input == 'signin' ||
    input == 'signup' ||
    input == 'verify' ||
    input == 'resend_verify' ||
    input == 'reset_password'
  ) {
    return true;
  } else return false;
};
