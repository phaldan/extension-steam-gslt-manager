import SelectList from './SelectList';
import SelectState from './SelectState';

describe('SelectList', () => {
  let target;

  beforeEach(() => {
    target = new SelectList();
  });

  test('all', () => {
    expect(target.all).toEqual([]);
  });

  test('add', () => {
    target.add('example', true);
    const entry = new SelectState('example', true);
    expect(target.selected).toEqual([entry]);
    expect(target.all).toEqual([entry]);
  });

  test('clearSelections', () => {
    target.add('example', true);
    target.clearSelections();
    expect(target.selected).toEqual([]);
  });

  test('set by create new', () => {
    target.set('example', false);
    const entry = new SelectState('example', false);
    expect(target.selected).toEqual([]);
    expect(target.all).toEqual([entry]);
  });

  test('set by override', () => {
    target.set('example', false);
    target.set('example', true);
    const entry = new SelectState('example', true);
    expect(target.selected).toEqual([entry]);
    expect(target.all).toEqual([entry]);
  });
});
