import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react'
import qs from 'qs'
import { ID, QueryResponseContextProps, QueryState } from './models'

function createResponseContext<T>(initialState: QueryResponseContextProps<T>) {
  return createContext(initialState)
}

function isNotEmpty(obj: unknown) {
  return obj !== undefined && obj !== null && obj !== ''
}

// Example: page=1&items_per_page=10&sort=id&order=desc&search=a&filter_name=a&filter_online=false
function stringifyRequestQuery(state: QueryState): string {
  const pagination = qs.stringify(state, { filter: ['page', 'items_per_page'], skipNulls: true })
  const sort = qs.stringify(state, { filter: ['sort', 'order'], skipNulls: true })
  const search = isNotEmpty(state.search)
    ? qs.stringify(state, { filter: ['search'], skipNulls: true })
    : ''

  const filter = state.filter
    ? Object.entries(state.filter)
      .filter((obj) => isNotEmpty(obj[1]))
      .map((obj) => {
        return `filter_${obj[0]}=${obj[1]}`
      })
      .join('&')
    : ''

  return [pagination, sort, search, filter]
    .filter((f) => f)
    .join('&')
    .toLowerCase()
}

function parseRequestQuery(query: string): QueryState {
  const cache: unknown = qs.parse(query)
  return cache as QueryState
}

function calculatedGroupingIsDisabled<T>(isLoading: boolean, data: Array<T> | undefined): boolean {
  if (isLoading) {
    return true
  }

  return !data || !data.length
}

function calculateIsAllDataSelected<T>(data: Array<T> | undefined, selected: Array<ID>): boolean {
  if (!data) {
    return false
  }

  return data.length > 0 && data.length === selected.length
}

function groupingOnSelect(
  id: ID,
  selected: Array<ID>,
  setSelected: Dispatch<SetStateAction<Array<ID>>>
) {
  if (!id) {
    return
  }

  if (selected.includes(id)) {
    setSelected(selected.filter((itemId) => itemId !== id))
  } else {
    const updatedSelected = [...selected]
    updatedSelected.push(id)
    setSelected(updatedSelected)
  }
}

function groupingOnSelectAll<T>(
  isAllSelected: boolean,
  setSelected: Dispatch<SetStateAction<Array<ID>>>,
  data?: Array<T & { id?: ID }>
) {
  if (isAllSelected) {
    setSelected([])
    return
  }

  if (!data || !data.length) {
    return
  }

  setSelected(data.filter((item) => item.id).map((item) => item.id))
}

function generateUniqueCode(length: number = 4, startWith: string = ''): string {
  const prefix = startWith
    .toLocaleLowerCase()
    .slice(0, length);

  const remainingLength = length - prefix.length;
  if (remainingLength <= 0) return prefix;

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersArray = characters.split('');

  const randomPart: string[] = [];
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charactersArray.length);
    randomPart.push(charactersArray[randomIndex]);
  }
  return prefix + randomPart.join('').toLocaleLowerCase();
}

function generateCodeFormText(text: string): string {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 -]/g, '')
    .toLocaleLowerCase();

  const tokens = normalized
    .split(/[\s-]+/)
    .filter(t => t.length > 0);

  if (tokens.length === 0) {
    return '';
  }

  const origTokens = text.trim().split(/[\s-]+/).filter(t => t.length > 0);
  const firstOrig = origTokens[0] || '';
  const isAllUpper = /^[A-Z0-9]+$/.test(firstOrig);

  let prefixTokens: string[];
  let suffixTokens: string[];

  if (isAllUpper) {
    prefixTokens = [tokens[0]];
    suffixTokens = tokens.slice(1);
  } else {
    prefixTokens = tokens.slice(0, 3);
    suffixTokens = tokens.slice(3);
  }
  const prefix = prefixTokens
    .map(tok => isAllUpper ? tok : tok.charAt(0))
    .join('');
  const suffix = suffixTokens
    .map(tok => tok.charAt(0))
    .join('');

  return `${prefix}-${suffix}`;
}

// Hook
function useDebounce(value: string | undefined, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )
  return debouncedValue
}

export {
  createResponseContext,
  stringifyRequestQuery,
  parseRequestQuery,
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  groupingOnSelectAll,
  useDebounce,
  isNotEmpty,
  generateUniqueCode,
  generateCodeFormText
}
