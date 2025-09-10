import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Tag } from '../../../core/types';
import { TagActions } from './tag.actions';

export interface TagState extends EntityState<Tag> {
  loading: boolean;
  error: string | null;
  q: string;
  total: number;
}

export const tagAdapter = createEntityAdapter<Tag>({
  selectId: (t) => t.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

export const initialState: TagState = tagAdapter.getInitialState({
  loading: false,
  error: null,
  q: '',
  total: 0,
});

export const tagReducer = createReducer(
  initialState,
  on(TagActions.load, (s, { q }) => ({ ...s, loading: true, error: null, q: q ?? '' })),
  on(TagActions.loadSuccess, (s, { resp }) => {
    const st = tagAdapter.setAll(resp.items, s);
    return { ...st, loading: false, total: resp.meta.total };
  }),
  on(TagActions.loadFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(TagActions.createSuccess, (s, { tag }) => tagAdapter.upsertOne(tag, s)),
  on(TagActions.updateSuccess, (s, { tag }) => tagAdapter.upsertOne(tag, s)),
  on(TagActions.deleteSuccess, (s, { id }) => tagAdapter.removeOne(id, s)),
);

export const {
  selectAll: selectAllTags,
  selectEntities: selectTagEntities,
  selectIds: selectTagIds,
  selectTotal: selectTagCount,
} = tagAdapter.getSelectors();
