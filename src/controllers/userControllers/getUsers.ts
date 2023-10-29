import { Request, Response } from 'express';
import validator from 'validator';
import { ErrorReturn } from '../../types/return.type';
import {
  isBoolean,
  isNumber,
  isUserRole,
  isUserStatus,
} from '../../utils/functions/validateInputs';
import { prismaClient } from '../../lib/prisma/prismaClient';
import { UserSearchData } from '../../types/user.type';
import { UserRole, UserStatus } from '@prisma/client';

const { escape, isEmpty, isEmail, normalizeEmail } = validator;

export const getUsers = async (req: Request, res: Response) => {
  let { name, username, email, role, status, teacher, biopublic, page, limit } =
    req.query;

  const searchData: UserSearchData = {};

  //validate and sanitise url params. If param passes all tests it goes into the searchData object
  if (name) {
    name = escape(name as string).trim();
    if (!isEmpty(name, { ignore_whitespace: true })) {
      searchData.name = { contains: name };
    }
  }

  if (username) {
    username = escape(name as string).trim();
    if (!isEmpty(username, { ignore_whitespace: true })) {
      searchData.user_name = { contains: username };
    }
  }

  if (email) {
    if (!isEmail(email as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "email" search parameter.',
        params: ['email'],
      };
      res.status(400).json(error);
      return;
    } else {
      email = email = escape(email as string).trim();
      email = normalizeEmail(email, { gmail_remove_dots: false }) as string;
      if (!isEmpty(email, { ignore_whitespace: true })) {
        searchData.email = { contains: email };
      }
    }
  }

  if (role) {
    if (!isUserRole(role as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "role" search parameter.',
        params: ['role'],
      };
      res.status(400).json(error);
      return;
    } else {
      role = escape(role as string).trim();
      if (!isEmpty(role, { ignore_whitespace: true })) {
        searchData.role = role as UserRole;
      }
    }
  }

  if (status) {
    if (!isUserStatus(status as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "status" search parameter.',
        params: ['status'],
      };
      res.status(400).json(error);
      return;
    } else {
      status = escape(status as string).trim();
      if (!isEmpty(status, { ignore_whitespace: true })) {
        searchData.status = status as UserStatus;
      }
    }
  }

  if (teacher) {
    if (!isBoolean(teacher as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "teacher" search parameter.',
        params: ['teacher'],
      };
      res.status(400).json(error);
      return;
    } else {
      teacher = escape(teacher as string).trim();
      if (!isEmpty(teacher, { ignore_whitespace: true })) {
        searchData.is_teacher = Boolean(teacher);
      }
    }
  }

  if (biopublic) {
    if (!isBoolean(biopublic as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "biopublic" search parameter.',
        params: ['biopublic'],
      };
      res.status(400).json(error);
      return;
    } else {
      biopublic = escape(biopublic as string).trim();
      if (!isEmpty(biopublic, { ignore_whitespace: true })) {
        searchData.is_bio_public = Boolean(biopublic);
      }
    }
  }

  let pageNum: number = 1;
  if (page) {
    if (!isNumber(page as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "page" search parameter.',
        params: ['page'],
      };
      res.status(400).json(error);
      return;
    } else {
      pageNum = parseInt(escape(page as string).trim());
    }
  }

  let limitNum: number = 10;
  if (limit) {
    if (!isNumber(limit as string)) {
      const error: ErrorReturn = {
        code: 400,
        message: 'Invalid "limit" search parameter.',
        params: ['limit'],
      };
      res.status(400).json(error);
      return;
    } else {
      if (parseInt(escape(limit as string).trim()) > 10) {
        limitNum = 10;
      } else {
        limitNum = parseInt(escape(limit as string).trim());
      }
    }
  }

  try {
    //get number of users that match search params
    const userCount = await prismaClient.user.count({
      where: searchData,
    });

    //fetch users if count is higher than 0
    if (userCount == 0) {
      const error: ErrorReturn = {
        code: 500,
        message: 'No matching users found.',
      };
      res.status(404).json(error);
      return;
    } else {
      try {
        const users = await prismaClient.user.findMany({
          skip: pageNum * limitNum - limitNum,
          take: limitNum,
          where: searchData,
        });

        //remove password from user data
        const userData = users.map((item) => {
          const { password, ...user } = item;
          return user;
        });

        const result = {
          currentPage: pageNum,
          totalPages: userCount % limitNum,
          numberOfResults: users.length,
          totalNumberOfResults: userCount,
          users: userData,
        };
        res.status(200).json(result);
      } catch (err) {
        const error: ErrorReturn = {
          code: 500,
          message: (err as Error).message,
        };
        res.status(500).json(error);
        return;
      }
    }
  } catch (err) {
    const error: ErrorReturn = {
      code: 500,
      message: (err as Error).message,
    };
    res.status(500).json(error);
    return;
  }
};
