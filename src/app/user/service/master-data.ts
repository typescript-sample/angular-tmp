import {Injectable} from '@angular/core';
import {ValueText} from 'onecore';

export interface MasterDataService {
  getGenders(): Promise<ValueText[]>;
  getStatus(): Promise<ValueText[]>;
  getTitles(): Promise<ValueText[]>;
  getPositions(): Promise<ValueText[]>;
}

@Injectable()
export class MasterDataClient implements MasterDataService {
  constructor() {
    this.getGenders = this.getGenders.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.getTitles = this.getTitles.bind(this);
    this.getPositions = this.getPositions.bind(this);
  }
  private genders = [
    { value: 'M', text: 'Male' },
    { value: 'F', text: 'Female' }
  ];
  private status = [
    {
      value: 'A',
      text: 'Active',
    },
    {
      value: 'I',
      text: 'Inactive',
    }
  ];
  private titles = [
    { text: 'Mr', value: 'Mr' },
    { text: 'Mrs', value: 'Mrs' },
    { text: 'Ms', value: 'Ms' },
    { text: 'Dr', value: 'Dr' }
  ];
  private positions = [
    { value: 'E', text: 'Employee' },
    { value: 'M', text: 'Manager' },
    { value: 'D', text: 'Director' }
  ];
  getGenders(): Promise<ValueText[]> {
    return Promise.resolve(this.genders);
  }
  getStatus(): Promise<ValueText[]> {
    return Promise.resolve(this.status);
  }
  getTitles(): Promise<ValueText[]> {
    return Promise.resolve(this.titles);
  }
  getPositions(): Promise<ValueText[]> {
    return Promise.resolve(this.positions);
  }
}
