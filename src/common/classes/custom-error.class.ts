export class CustomError extends Error {
  isLogged: boolean;

  constructor(message?: string, isLogged?: boolean) {
    super(message);
    this.name = 'Custom Error';

    this.isLogged = isLogged ?? false;
  }
}

export class InternalError extends CustomError {
  constructor(message?: string, isLogged?: boolean) {
    super(message, isLogged);
    this.name = 'Internal Error';
  }
}

export class CrmError extends CustomError {
  constructor(message?: string, isLogged?: boolean) {
    super(message, isLogged);
    this.name = 'Crm Error';
  }
}

export class OrderManagerError extends CustomError {
  constructor(message?: string, isLogged?: boolean) {
    super(message, isLogged);
    this.name = 'Order Manager Error';
  }
}
