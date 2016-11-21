
export class CoalesceException {

}

export class AdapterException extends CoalesceException {

  constructor(response) {
    super();
    this.response = response;
  }

}

export class EntityException extends AdapterException {

  constructor(entity, ...args) {
    super(...args);
    this.entity = entity;
  }

}

export class EntityNotFound extends EntityException {

}

export class EntityConflict extends EntityException {

}

export class EntityInvalid extends EntityException {

}

export class ServerError extends AdapterException {

}

export class NetworkError extends AdapterException {

}
