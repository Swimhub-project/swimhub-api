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
