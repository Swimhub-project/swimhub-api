export const isUserRole = (input: string): boolean => {
  if (input == 'user' || input == 'moderator' || input == 'admin') {
    return true;
  } else return false;
};

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

export const isBoolean = (input: string): boolean => {
  if (input == 'true' || input == 'false') {
    return true;
  } else return false;
};

export const isNumber = (input: string): boolean => {
  if (Number.isNaN(parseInt(input))) {
    return false;
  } else return true;
};
